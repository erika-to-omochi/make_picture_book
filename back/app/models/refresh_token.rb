class RefreshToken < ApplicationRecord
  belongs_to :user

  before_create :generate_token

  validates :token, presence: true, uniqueness: true
  validates :expires_at, presence: true

  attr_reader :plain_token

  private

  # トークンを生成
  def generate_token
    @plain_token = SecureRandom.hex(32) # 平文トークンを生成
    self.token = Digest::SHA256.hexdigest(@plain_token) # ハッシュ化したトークンを保存
  end

  # 平文トークンからDB上のハッシュ化トークンを探す
  def self.find_by_token(token)
    hashed_token = Digest::SHA256.hexdigest(token)
    find_by(token: hashed_token)
  end
end
