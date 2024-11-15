class RefreshToken < ApplicationRecord
  belongs_to :user

  before_create :hash_token

  validates :token, presence: true
  validates :expires_at, presence: true

  def hash_token
    Rails.logger.debug "Original Token before hashing: #{self.token}"
    self.token = Digest::SHA256.hexdigest(self.token)
    Rails.logger.debug "Token after hashing: #{self.token}"
  end

  def self.find_by_token(token)
    hashed_token = Digest::SHA256.hexdigest(token)
    find_by(token: hashed_token)
  end
end
