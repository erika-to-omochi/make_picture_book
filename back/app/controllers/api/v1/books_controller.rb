class Api::V1::BooksController < ApplicationController
  before_action :authenticate_user!, except: [:index, :show, :public_books]

  def author_status
    book = Book.find(params[:id]) # IDから絵本を取得
    is_author = book.user_id == current_user.id # 作者かどうかを判定

    render json: { is_author: is_author }, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Book not found" }, status: :not_found
  end

  def public_books
    books = Book.published
    books = apply_filters(books)
    books = books.order(created_at: :desc)
                .page(params[:page])
                .per(params[:per_page] || 9)
    render json: {
      books: books.as_json(
        include: [:tags, :pages]
      ),
      pagination: pagination_meta(books)
    }, status: :ok
  end

  def my_books
    books = Book.my_books(current_user.id)
                .order(created_at: :desc)
    books = apply_filters(books)
                .page(params[:page])
                .per(params[:per_page] || 9)
    render json: {
      books: books.as_json(
        only: [:id, :title, :author_name, :created_at, :user_id, :is_draft, :visibility],
        include: {
          pages: { only: [:page_number] },
          tags: { only: [:name] }
        }
      ),
      meta: pagination_meta(books)
    }, status: :ok
  end

  def index
    books = Book.published
    books = apply_filters(books)
    books = books.page(params[:page]).per(params[:per_page] || 9)
    render json: {
      books: books.as_json(
        only: [:id, :title, :author_name, :created_at],
        include: {
          pages: { only: [:page_number] },
          tags: { only: [:name] }
        }
      ),
      meta: pagination_meta(books)
    }, status: :ok
  end

  def show
    book = Book.includes(pages: [:page_characters, :page_elements]).find(params[:id])
    render json: book.as_json(
      include: {
        pages: {
          only: [:id, :page_number, :background_color],
          include: {
            page_characters: {
              only: [:id, :element_type, :position_x, :position_y, :rotation, :scale_x, :scale_y, :parts]
            },
            page_elements: {
              only: [:id, :element_type, :text, :src, :font_size, :font_color, :position_x, :position_y, :rotation, :scale_x, :scale_y]
            }
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

  def update
    book = current_user.books.find(params[:id])
    if book.update(book_params)
      render json: { message: 'Book updated successfully', book: book }, status: :ok
    else
      render json: { errors: book.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Book not found or not authorized" }, status: :not_found
  end

  def destroy
    book = current_user.books.find(params[:id])
    book.destroy
    render json: { message: 'Book deleted successfully' }, status: :ok
    rescue ActiveRecord::RecordNotFound
      render json:{ error: "Book not found or not authorized" }, status: :not_found
  end

  private

  def apply_filters(books)
    books = books.search_by_tags(params[:tags].split(',').map(&:strip)) if params[:tags].present?
    books = books.search_by_query(params[:query].strip) if params[:query].present?
    books
  end

  def pagination_meta(books)
    {
      current_page: books.current_page,
      next_page: books.next_page,
      prev_page: books.prev_page,
      total_pages: books.total_pages,
      total_count: books.total_count,
      limit_value: books.limit_value
    }
  end

  def book_params
    params.require(:book).permit(:title, :author_name, :visibility, :is_draft, tags: [])
  end
end