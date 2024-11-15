class Page < ApplicationRecord
  belongs_to :book

  validates :page_number, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :content, presence: true
  validates :page_number, uniqueness: { scope: :book_id, message: "同じ本に同じページ番号が存在します" }
end
