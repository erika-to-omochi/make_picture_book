module Api
  module V1
    module Auth
      class PasswordsController < ApplicationController
        def create
          user = User.find_by(email: params[:email])

          if user.present?
            user.send_reset_password_instructions
            render json: { message: 'パスワードリセットの手順をメールで送信しました。' }, status: :ok
          else
            render json: { error: 'ユーザーが見つかりませんでした' }, status: :not_found
          end
        end

        def update
          user = User.reset_password_by_token(params[:reset_token])

          if user.errors.empty?
            render json: { message: 'パスワードが正常にリセットされました' }, status: :ok
          else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
          end
        end
      end
    end
  end
end
