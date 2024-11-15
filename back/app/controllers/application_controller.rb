class ApplicationController < ActionController::API
  include Devise::Controllers::Helpers # Deviseのヘルパーを利用可能にする

  before_action :authenticate_user!
  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

  def current_user
    @current_user ||= User.find_by(id: decoded_auth_token['sub'])
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
    devise_parameter_sanitizer.permit(:account_update, keys: [:name])
  end

  def authenticate_user!
    begin
      decoded_token = decoded_auth_token
      user_id = decoded_token['sub']
      @current_user = User.find_by(id: user_id)
      render json: { error: 'Unauthorized' }, status: :unauthorized unless @current_user
    rescue JWT::DecodeError
      render json: { error: 'Invalid token' }, status: :unauthorized
    end
  end

  private

  def decoded_auth_token
    token = request.headers['Authorization']&.split(' ')&.last
    return nil unless token
    JWT.decode(token, Rails.application.credentials.dig(:jwt, :secret), true, algorithm: 'HS256').first
  end
end
