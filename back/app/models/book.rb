class Book < ApplicationRecord
  belongs_to :user
  has_many :pages, dependent: :destroy
  has_many :book_tags, dependent: :destroy
  has_many :tags, through: :book_tags

  accepts_nested_attributes_for :pages, allow_destroy: true

  validates :title, presence: true
  validates :author_name, presence: true
  validates :visibility, inclusion: { in: [0, 1] } #0 = 全体公開, 1 = 自分のみ
  validates :is_draft, inclusion: { in: [true, false] }

  scope :published, -> { where(is_draft: false) }
  scope :drafts, -> { where(is_draft: true) }
end
