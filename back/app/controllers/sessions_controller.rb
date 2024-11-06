class SessionsController < Devise::SessionsController
  respond_to :json

  def create
    super do |resource|
      # リフレッシュトークンを生成
      refresh_token = resource.refresh_tokens.create!(
        token: SecureRandom.hex(32),
        expires_at: 7.days.from_now
      )

      # JWTアクセストークンを取得
      access_token = Warden::JWTAuth::UserEncoder.new.call(resource, :user, nil).first

      render json: {
        access_token: access_token,
        refresh_token: refresh_token.token
      }, status: :ok and return
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  def destroy
    if current_user
      # リフレッシュトークンの削除
      current_user.refresh_tokens.find_by(token: params[:refresh_token])&.destroy
    end
    super
  end

  private

  def respond_with(resource, _opts = {})
    render json: UserSerializer.new(resource).serializable_hash, status: :ok
  end

  def respond_to_on_destroy
    head :no_content
  end
end
