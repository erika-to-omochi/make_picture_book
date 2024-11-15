class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 6 }, if: :password_required?

  has_many :refresh_tokens, dependent: :destroy
  has_many :books, dependent: :destroy

  def jwt_subject
    id
  end

  private

  def password_required?
    new_record? || password.present?
  end
end
