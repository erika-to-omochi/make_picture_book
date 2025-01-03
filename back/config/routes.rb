Rails.application.routes.draw do
  get 'health/check'
  post '/forms', to: 'forms#create'
  # Devise の認証ルート
  devise_for :users, path: 'api/v1/auth', controllers: {
    sessions: 'api/v1/auth/sessions',
    registrations: 'api/v1/auth/registrations',
    passwords: 'api/v1/auth/passwords',
    omniauth_callbacks: 'api/v1/auth/omniauth_callbacks'
  }

  namespace :api do
    namespace :v1 do
      namespace :auth do
        post 'refresh', to: 'tokens#refresh'
      end
      resources :books  do
        resources :pages, only: [:index, :show, :create, :update, :destroy]
        resources :comments, only: [:index, :create, :update, :destroy]
        collection do
          get :public_books
          get :my_books
        end
        member do
          get :author_status
        end
      end
    end
  end
  get 'ogp', to: 'ogp#show'

  if Rails.env.development?
    mount LetterOpenerWeb::Engine, at: "/letter_opener"
  end

  root to: 'health#check'
end
