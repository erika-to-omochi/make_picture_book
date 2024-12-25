class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :omniauthable, omniauth_providers: [:google_oauth2]

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 6 }, if: :password_required?

  has_many :refresh_tokens, dependent: :destroy
  has_many :books, dependent: :destroy
  has_many :comments, dependent: :destroy

  def jwt_subject
    id
  end

  # from_omniauthメソッド
  def self.from_omniauth(auth)
    user = find_by(email: auth.info.email)
    if user
      user.update(provider: auth.provider, uid: auth.uid) unless user.provider && user.uid
    else
      user = where(provider: auth.provider, uid: auth.uid).first_or_initialize
      user.email = auth.info.email
      user.password = Devise.friendly_token[0, 20]
      user.name = auth.info.name
      unless user.save
        Rails.logger.error "User creation failed: #{user.errors.full_messages.join(", ")}"
      end
    end
    user
  end

  # JWTトークン生成メソッドが正しく定義されていることを確認
  def generate_jwt
    # JWT生成ロジック（例）
    JWT.encode({ user_id: id, exp: 24.hours.from_now.to_i }, Rails.application.credentials.dig(:jwt, :secret), 'HS256')
  end

  private

  def password_required?
    new_record? || password.present?
  end
end
