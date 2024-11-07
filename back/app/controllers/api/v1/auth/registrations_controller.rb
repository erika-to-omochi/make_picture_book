class Api::V1::Auth::RegistrationsController < ApplicationController

  def create
    user = User.new(user_params)

    if user.save
      access_token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
      render json: {
        message: 'アカウントを作成しました',
        access_token: access_token,
        user: UserSerializer.new(user).serializable_hash
      }, status: :created
    else
      # カスタムエラーメッセージ
      custom_errors = user.errors.messages.map do |attribute, messages|
        messages.map do |message|
          case attribute
          when :password_confirmation
            "パスワード（確認用）が一致しません"
          when :password
            message.include?("is too short") ? "パスワードは6文字以上である必要があります" : "パスワードに問題があります"
          when :email
            "メールアドレスは既に使用されています" if message.include?("has already been taken")
          else
            "#{attribute.to_s.humanize}にエラーがあります: #{message}"
          end
        end
      end.flatten.compact

      render json: {
        errors: custom_errors,
        access_token: nil,
        user: UserSerializer.new(user).serializable_hash
      }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation)
  end
end
