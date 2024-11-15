class Api::V1::BooksController < ApplicationController
  before_action :authenticate_user!

  def create
    book = current_user.books.build(book_params)
    if book.save
      render json: { message: 'Book created successfully', book: book }, status: :created
    else
      render json: { errors: book.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def show
    book = Book.includes(:pages, :tags).find(params[:id])
    render json: book.as_json(include: { pages: { only: [:page_number, :content] }, tags: { only: [:name] } })
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Book not found' }, status: :not_found
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
