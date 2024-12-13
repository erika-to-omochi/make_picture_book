class Book < ApplicationRecord
  belongs_to :user
  has_many :pages, dependent: :destroy
  has_many :book_tags, dependent: :destroy
  has_many :tags, through: :book_tags
  has_many :comments, dependent: :destroy

  accepts_nested_attributes_for :pages, allow_destroy: true

  # 下書きではない場合のみ、タイトルと作者名を必須にする
  validates :title, presence: true, unless: :is_draft
  validates :author_name, presence: true, unless: :is_draft

  # visibility と is_draft のバリデーション
  validates :visibility, inclusion: { in: [0, 1] } # 0 = 全体公開, 1 = 自分のみ
  validates :is_draft, inclusion: { in: [true, false] }

  # スコープ
  scope :published, -> { where(is_draft: false, visibility: 0) }
  scope :drafts, -> { where(is_draft: true) }
  scope :my_books, ->(user_id) { where(user_id: user_id) }

  paginates_per 9
end
