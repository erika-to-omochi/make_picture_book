class ApplicationController < ActionController::API
  include Devise::Controllers::Helpers # Deviseのヘルパーを利用可能にする

  before_action :authenticate_user!
  protected

  def current_user
    @current_user ||= User.find_by(id: decoded_auth_token['sub'])
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
    devise_parameter_sanitizer.permit(:account_update, keys: [:name])
  end

  # JWTの有効期限切れエラーをハンドル
  rescue_from JWT::ExpiredSignature, with: :handle_jwt_expired
  rescue_from JWT::DecodeError, with: :handle_jwt_decode_error


  def authenticate_user!
    decoded_token = decoded_auth_token

    if decoded_token && decoded_token['sub']
      user_id = decoded_token['sub']
      @current_user = User.find_by(id: user_id)

      unless @current_user
        render json: { error: 'Unauthorized' }, status: :unauthorized
      end
    else
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  rescue JWT::DecodeError => e
    render json: { error: 'Invalid token' }, status: :unauthorized
  end

  private

  def decoded_auth_token
    token = request.headers['Authorization']&.split(' ')&.last
    return nil unless token
    JWT.decode(token, Rails.application.credentials.dig(:jwt, :secret), true, algorithm: 'HS256').first
  end

  def handle_jwt_expired
    render json: { error: 'アクセストークンの有効期限が切れています' }, status: :unauthorized
  end

  def handle_jwt_decode_error
    render json: { error: '無効なアクセストークンです' }, status: :unauthorized
  end
end
