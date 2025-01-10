class Api::V1::Auth:: TokensController < ApplicationController
  skip_before_action :authenticate_user!, only: [:refresh], raise: false

  def refresh
    token = params[:refresh_token] || params.dig(:token, :refresh_token)

    if token.nil?
      render json: { error: 'リフレッシュトークンが提供されていません' }, status: :unprocessable_entity
      return
    end

    refresh_token = RefreshToken.find_by_token(token)
    if refresh_token.nil? || refresh_token.expires_at <= Time.current
      render json: { error: 'リフレッシュトークンが無効または期限切れです' }, status: :unauthorized
      return
    end

    user = refresh_token.user
    refresh_token.destroy
    new_refresh_token = user.refresh_tokens.create!(expires_at: 7.days.from_now)
    new_access_token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first

    render json: {
      access_token: new_access_token,
      refresh_token: new_refresh_token.plain_token
    }, status: :ok
  end
end
