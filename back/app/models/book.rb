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
  scope :search_by_tags, ->(tags) {
    joins(:tags).where('tags.name ILIKE ANY (ARRAY[?])', tags.map { |tag| "%#{tag}%" }).distinct
  }
  scope :search_by_title, ->(title) {
    where('books.title ILIKE ?', "%#{title}%") if title.present?
  }
  scope :search_by_author, ->(author) {
    where('books.author_name ILIKE ?', "%#{author}%") if author.present?
  }

  paginates_per 9

  # カスタムの tags= メソッド
  def tags=(tag_names)
    tag_objects = tag_names.map do |name|
      Tag.find_or_create_by(name: name.strip)
    end
    super(tag_objects)
  end
end
