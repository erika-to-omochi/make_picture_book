module Api
  module V1
    module Auth
      class PasswordsController < ApplicationController
        def create
          user = User.find_by(email: params[:email])

          if user.present?
            user.send_reset_password_instructions
            render json: { message: 'Password reset instructions sent' }, status: :ok
          else
            render json: { error: 'User not found' }, status: :not_found
          end
        end

        def update
          user = User.reset_password_by_token(params[:reset_token])

          if user.errors.empty?
            render json: { message: 'Password has been reset successfully' }, status: :ok
          else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
          end
        end
      end
    end
  end
end
