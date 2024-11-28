Rails.application.routes.draw do
  get 'health/check'
  # Devise の認証ルート
  devise_for :users, path: 'api/v1/auth', controllers: {
    sessions: 'api/v1/auth/sessions',
    registrations: 'api/v1/auth/registrations',
    passwords: 'api/v1/auth/passwords'
  }

  namespace :api do
    namespace :v1 do
      namespace :auth do
        post 'refresh', to: 'tokens#refresh'
      end
      resources :books  do
        resources :pages, only: [:index, :show, :create, :update, :destroy]
        collection do
          get :my_books
        end
        member do
          get :author_status
        end
      end
    end
  end
  root to: 'health#check'
end
