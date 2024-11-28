class Api::V1::PagesController < ApplicationController
  before_action :authenticate_user!, only: [:create]

  def index
    if params[:book_id]
      pages = Page.where(book_id: params[:book_id])
      render json: { pages: pages.as_json(include: [:page_characters, :page_elements]) }, status: :ok
    else
      render json: { error: 'Book ID is required' }, status: :bad_request
    end
  end

  def create
    Rails.logger.debug("Received params: #{params.inspect}")
    last_page_number = Page.where(book_id: page_params[:book_id]).maximum(:page_number) || 0
    page = Page.new(page_params.merge(page_number: last_page_number + 1))

    if page.save
      render json: { page: page.as_json(include: [:page_characters, :page_elements]) }, status: :created
    else
      Rails.logger.debug("Validation errors: #{page.errors.full_messages}")
      render json: { errors: page.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def show
    page = Page.find_by(id: params[:id])
    if page
      render json: { page: page.as_json(include: [:page_characters, :page_elements]) }
    else
      render json: { error: 'Page not found' }, status: :not_found
    end
  end

  def update
    page = Page.find_by(id: params[:id])
    if page
      if page.update(page_params)
        render json: { page: page.as_json(include: [:page_characters, :page_elements]) }, status: :ok
      else
        Rails.logger.debug("Validation errors: #{page.errors.full_messages}")
        render json: { errors: page.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: 'Page not found' }, status: :not_found
    end
  end

  private

  def page_params
    params.require(:page).permit(
      :book_id,
      :page_number,
      :background_color,
      page_elements_attributes: [
        :element_type, :text, :src, :font_size, :font_color,
        :position_x, :position_y, :rotation, :scale_x, :scale_y
      ],
      page_characters_attributes: []
    )
  end
end
