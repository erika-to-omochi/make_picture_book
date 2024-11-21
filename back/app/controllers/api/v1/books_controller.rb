class Api::V1::BooksController < ApplicationController
  before_action :authenticate_user!, only: [:create,:author_status]


  def author_status
    book = Book.find(params[:id]) # IDから絵本を取得
    is_author = book.user_id == current_user.id # 作者かどうかを判定

    render json: { is_author: is_author }, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Book not found" }, status: :not_found
  end


  def index
    books = Book.all
    render json: books.as_json(
      only: [:id, :title, :author_name, :created_at],
      include: {
        pages: { only: [:page_number] },
        tags: { only: [:name] }
      }
    ), status: :ok
  end

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
      :title,
      :author_name,
      :description,
      :visibility,
      :is_draft,
      tag_ids: [],
      pages_attributes: [
        :page_number,
        content: [
          :title,
          :author,
          :tags,
          :backgroundColor,
          :visibility,
          texts: [
            :text,
            :fontSize,
            :color,
            :x,
            :y,
            :rotation,
            :scaleX,
            :scaleY
          ],
          images: [
            :src,
            :x,
            :y,
            :width,
            :height,
            :rotation,
            :scaleX,
            :scaleY
          ]
        ]
      ]
    )
  end
end