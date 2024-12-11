# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2024_12_11_132316) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  # Custom types defined in this database.
  # Note that some types may not work with other database engines. Be careful if changing database.
  create_enum "element_type_enum", ["object", "nature", "text", "background", "image"]

  create_table "book_tags", force: :cascade do |t|
    t.bigint "book_id", null: false
    t.bigint "tag_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["book_id", "tag_id"], name: "index_book_tags_on_book_id_and_tag_id", unique: true
    t.index ["book_id"], name: "index_book_tags_on_book_id"
    t.index ["tag_id"], name: "index_book_tags_on_tag_id"
  end

  create_table "books", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "title", null: false
    t.string "author_name", null: false
    t.text "description"
    t.integer "visibility", default: 0, null: false
    t.boolean "is_draft", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["author_name"], name: "index_books_on_author_name"
    t.index ["user_id"], name: "index_books_on_user_id"
  end

  create_table "comments", force: :cascade do |t|
    t.bigint "book_id", null: false
    t.bigint "user_id", null: false
    t.text "content", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["book_id", "user_id"], name: "index_comments_on_book_id_and_user_id"
    t.index ["book_id"], name: "index_comments_on_book_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "page_characters", force: :cascade do |t|
    t.bigint "page_id", null: false
    t.integer "character_type", default: 0, null: false
    t.string "simple_path"
    t.string "body_path"
    t.string "hair_path"
    t.string "eye_path"
    t.string "mouth_path"
    t.string "hand_path"
    t.string "foot_path"
    t.string "outfit_path"
    t.integer "position_x", null: false
    t.integer "position_y", null: false
    t.integer "rotation", default: 0
    t.float "scale_x", default: 1.0
    t.float "scale_y", default: 1.0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["character_type"], name: "index_page_characters_on_character_type"
    t.index ["page_id"], name: "index_page_characters_on_page_id"
  end

  create_table "page_elements", force: :cascade do |t|
    t.bigint "page_id", null: false
    t.enum "element_type", null: false, enum_type: "element_type_enum"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "text"
    t.string "src"
    t.float "font_size"
    t.string "font_color"
    t.float "position_x"
    t.float "position_y"
    t.float "rotation"
    t.float "scale_x"
    t.float "scale_y"
    t.index ["element_type"], name: "index_page_elements_on_element_type"
    t.index ["page_id"], name: "index_page_elements_on_page_id"
  end

  create_table "pages", force: :cascade do |t|
    t.bigint "book_id", null: false
    t.integer "page_number", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "content", default: {}, null: false
    t.string "background_color"
    t.index ["book_id"], name: "index_pages_on_book_id"
  end

  create_table "refresh_tokens", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "token"
    t.datetime "expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["token"], name: "index_refresh_tokens_on_token"
    t.index ["user_id"], name: "index_refresh_tokens_on_user_id"
  end

  create_table "tags", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "name", null: false
    t.string "email", null: false
    t.string "encrypted_password", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.string "provider"
    t.string "uid"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["provider", "uid"], name: "index_users_on_provider_and_uid", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "book_tags", "books"
  add_foreign_key "book_tags", "tags"
  add_foreign_key "books", "users"
  add_foreign_key "comments", "books"
  add_foreign_key "comments", "users"
  add_foreign_key "page_characters", "pages"
  add_foreign_key "page_elements", "pages"
  add_foreign_key "pages", "books"
  add_foreign_key "refresh_tokens", "users"
end
