root "public/home#index"
get "about",      to: "public/about#index",      as: :about
get "services",   to: "public/services#index",   as: :services
get "portfolios", to: "public/portfolios#index", as: :portfolios
get "articles",   to: "public/articles#index",   as: :articles
get "contact",    to: "public/contact#index",    as: :contact
