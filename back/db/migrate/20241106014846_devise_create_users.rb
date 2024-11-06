# frozen_string_literal: true

class DeviseCreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      ## Database authenticatable
      t.string :name,               null: false
      t.string :email,              null: false
      t.string :encrypted_password, null: false

      ## Recoverable
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at

      ## Rememberable
      t.datetime :remember_created_at

      ## Trackable
      t.integer  :sign_in_count, default: 0, null: false
      t.datetime :current_sign_in_at
      t.datetime :last_sign_in_at
      t.string   :current_sign_in_ip
      t.string   :last_sign_in_ip

      ## OAuth (Google)
      t.string :provider
      t.string :uid

      t.timestamps null: false
    end

    ## Indexes
    add_index :users, :email,                unique: true
    add_index :users, :reset_password_token, unique: true
    add_index :users, [:provider, :uid],     unique: true  # Google OAuth用
    # add_index :users, :confirmation_token,   unique: true # Confirmableを使用する場合
    # add_index :users, :unlock_token,         unique: true # Lockableを使用する場合
  end
end
