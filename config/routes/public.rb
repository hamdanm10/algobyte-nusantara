root "public/home#index"

scope module: :public do
  resource :about,      only: :show, path: "about",      controller: :about
  resource :services,   only: :show, path: "services",   controller: :services
  resource :portfolios, only: :show, path: "portfolios", controller: :portfolios
  resource :articles,   only: :show, path: "articles",   controller: :articles
  resource :contact,    only: :show, path: "contact",    controller: :contact
end
