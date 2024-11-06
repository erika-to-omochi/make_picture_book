class SessionsController < Devise::SessionsController
  respond_to :json

  def create
    user = User.find_by(email: params[:email])

    if user&.valid_password?(params[:password])
      # リフレッシュトークンを生成
      refresh_token = user.refresh_tokens.create!(
        token: SecureRandom.hex(32),
        expires_at: 7.days.from_now
      )

      # JWTアクセストークンを取得
      access_token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first

      render json: {
        access_token: access_token,
        refresh_token: refresh_token.token,
        user: UserSerializer.new(user).serializable_hash
      }, status: :ok
    else
      render json: { error: 'Invalid credentials' }, status: :unauthorized
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  def destroy
    if current_user
      # リフレッシュトークンの削除
      current_user.refresh_tokens.find_by(token: params[:refresh_token])&.destroy
    end
    render json: { message: 'Logged out successfully' }, status: :ok
  end

  private

  def respond_with(resource, _opts = {})
    render json: UserSerializer.new(resource).serializable_hash, status: :ok
  end

  def respond_to_on_destroy
    head :no_content
  end
end
