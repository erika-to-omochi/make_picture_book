Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://127.0.0.1:4000',
            'http://localhost:4000',
            'https://ehon-ga-pon.com',
            'https://api.ehon-ga-pon.com',
            'https://back-make-books.fly.dev'

    resource "*",
      headers: :any,
      expose: ['Authorization'],
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
