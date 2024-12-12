class Api::V1::CommentsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_book, only: [:index, :create]
  before_action :set_comment, only: [:destroy, :update]

  def index
    @comments = @book.comments.includes(:user).order(created_at: :desc)
    render json: @comments.as_json(include: { user: { only: [:id, :name] } })
  end

  def create
    @comment = @book.comments.new(comment_params)
    @comment.user = current_user

    if @comment.save
      render json: @comment.as_json(include: { user: { only: [:id, :name] } }), status: :created
    else
      render json: { errors: @comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @comment.user == current_user
      if @comment.update(comment_params)
        render json: @comment.as_json(include: { user: { only: [:id, :name] } })
      else
        render json: { errors: @comment.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: "You are not authorized to update this comment." }, status: :forbidden
    end
  end

  def destroy
    if @comment.user == current_user
      @comment.destroy
      head :no_content
    else
      render json: { error: "You are not authorized to delete this comment." }, status: :forbidden
    end
  end

  private

  def set_book
    @book = Book.find(params[:book_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Book not found." }, status: :not_found
  end

  def set_comment
    @comment = Comment.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Comment not found." }, status: :not_found
  end

  def comment_params
    params.require(:comment).permit(:content)
  end
end
