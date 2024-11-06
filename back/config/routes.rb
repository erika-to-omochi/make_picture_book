Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      namespace :auth do
        devise_for :users, controllers: {
          sessions: 'api/v1/auth/sessions',
          registrations: 'api/v1/auth/registrations',
          passwords: 'api/v1/auth/passwords'
        }, skip: [:passwords, :registrations, :sessions] # 既存のカスタムルートを使うため

        # カスタム認証ルート
        post 'signup', to: 'registrations#create'
        post 'login', to: 'sessions#create'
        delete 'logout', to: 'sessions#destroy'
        post 'password/forgot', to: 'passwords#create'
        patch 'password/reset', to: 'passwords#update'
      end
    end
  end
end
