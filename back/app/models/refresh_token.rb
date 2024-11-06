class RefreshToken < ApplicationRecord
  belongs_to :user

  before_create :hash_token

  def hash_token
    self.token = Digest::SHA256.hexdigest(token)
  end

  def self.find_by_token(token)
    hashed_token = Digest::SHA256.hexdigest(token)
    find_by(token: hashed_token)
  end
end