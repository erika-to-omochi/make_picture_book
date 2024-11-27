class RefreshToken < ApplicationRecord
  belongs_to :user

  before_create :hash_token

  validates :token, presence: true, uniqueness: true
  validates :expires_at, presence: true

  private

  def generate_token
    @plain_token = SecureRandom.hex(32)
    self.token = Digest::SHA256.hexdigest(@plain_token)
  end

  def self.find_by_token(token)
    hashed_token = Digest::SHA256.hexdigest(token)
    find_by(token: hashed_token)
  end
end
