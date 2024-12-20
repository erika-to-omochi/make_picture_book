class Api::V1::PagesController < ApplicationController
  before_action :authenticate_user!, only: [:create, :update]

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
    page = Page.new(page_params)
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
    book = Book.find(params[:book_id])
    page = book.pages.find_by(id: params[:id])

    if page.nil?
      render json: { error: "Page not found for the specified book" }, status: :not_found
      return
    end

    if page.update(page_params)
      render json: { page: page.as_json(include: [:page_characters, :page_elements]) }, status: :ok
    else
      render json: { errors: page.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def page_params
    params.require(:page).permit(
      :book_id,
      :page_number,
      :background_color,
      page_elements_attributes: [
        :id,:_destroy,
        :element_type, :text, :src, :font_size, :font_color,
        :position_x, :position_y, :rotation, :scale_x, :scale_y
      ],
      page_characters_attributes: [
        :id, :_destroy,
        :element_type,
        :position_x, :position_y, :rotation, :scale_x, :scale_y,
        { parts: [:src] }
      ]
    )
  end
end
