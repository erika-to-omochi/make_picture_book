class Api::V1::BooksController < ApplicationController
  before_action :authenticate_user!, only: [:create]

  def create
    book = current_user.books.build(book_params)
    if book.save
      render json: { message: 'Book created successfully', book: book }, status: :created
    else
      render json: { errors: book.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def show
    book = Book.includes(pages: [:page_characters, :page_elements]).find(params[:id])
    render json: book.as_json(
      include: {
        pages: {
          only: [:page_number],
          include: {
            page_characters: { only: [:character_type, :position_x, :position_y] },
            page_elements: { only: [:element_type, :content] }
          }
        },
        tags: { only: [:name] }
      }
    ), status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Book not found" }, status: :not_found
  rescue JSON::ParserError => e
    Rails.logger.error("JSON Parse Error: #{e.message}")
    render json: { error: "Invalid JSON format in page content" }, status: :bad_request
  end

  private

  def book_params
    params.require(:book).permit(
      :title, :author_name, :description, :visibility, :is_draft,
      pages_attributes: [:page_number, :content],
      tag_ids: []
    )
  end
end
