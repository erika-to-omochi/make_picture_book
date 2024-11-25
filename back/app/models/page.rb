class Page < ApplicationRecord
  belongs_to :book
  has_many :page_characters, dependent: :destroy
  has_many :page_elements, dependent: :destroy

  validates :page_number, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :page_number, uniqueness: { scope: :book_id, message: "同じ本に同じページ番号が存在します" }

  accepts_nested_attributes_for :page_elements, allow_destroy: true
  accepts_nested_attributes_for :page_characters, allow_destroy: true
end