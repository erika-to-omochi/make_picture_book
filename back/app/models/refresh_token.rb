class RefreshToken < ApplicationRecord
  belongs_to :user

  before_validation :generate_token, on: :create

  validates :token, presence: true, uniqueness: true
  validates :expires_at, presence: true

  attr_reader :plain_token

  private

  # トークンを生成
  def generate_token
    Rails.logger.debug "Entering generate_token method"
    @plain_token = SecureRandom.hex(32) # 平文トークンを生成
    Rails.logger.debug "Generated plain token: #{@plain_token}"
    self.token = Digest::SHA256.hexdigest(@plain_token) # ハッシュ化したトークンを保存
    Rails.logger.debug "Hashed token: #{self.token}"
  end

  # 平文トークンからDB上のハッシュ化トークンを探す
  def self.find_by_token(token)
    hashed_token = Digest::SHA256.hexdigest(token)
    find_by(token: hashed_token)
  end
end
