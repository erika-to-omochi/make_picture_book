class RegistrationsController < ApplicationController
  def create
    user = User.new(user_params)

    if user.save
      # 必要に応じて確認メールの送信（メール設定がある場合）
      render json: { message: 'User registered successfully', user: user }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.permit(:name, :email, :password, :password_confirmation)
  end
end
