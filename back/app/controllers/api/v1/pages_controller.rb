class Api::V1::PagesController < ApplicationController
  before_action :authenticate_user!, only: [:create]

  def create
    Rails.logger.debug("Received params: #{params.inspect}")
    last_page_number = Page.where(book_id: page_params[:book_id]).maximum(:page_number) || 0
    page = Page.new(page_params.merge(page_number: last_page_number + 1))
    page.background_color = page_params[:content][:background_color]

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

  private

  def page_params
    params.require(:page).permit(
      :book_id,
      :page_number,
      content: [
        :background_color,
        texts: [:text, :font_size, :font_color, :position_x, :position_y, :rotation, :scale_x, :scale_y],
        images: [:src, :position_x, :position_y, :rotation, :scale_x, :scale_y]
      ]
    )
  end
end
