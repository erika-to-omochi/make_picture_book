# syntax = docker/dockerfile:1

# ベースイメージ
ARG RUBY_VERSION=3.2.2
FROM ruby:$RUBY_VERSION-slim AS base

LABEL fly_launch_runtime="rails"

# Rails appの作業ディレクトリ
WORKDIR /rails

# 環境変数の設定
ENV BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development:test" \
    RAILS_ENV="production"

# RubyGemsとBundlerの更新
RUN gem update --system --no-document && \
    gem install -N bundler

# ビルドステージ
FROM base AS build

# 必要なパッケージのインストール（rmagickの依存関係も含む）
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
        build-essential \
        libpq-dev \
        imagemagick \
        libmagickwand-dev \
        fonts-noto-cjk \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# GemfileとGemfile.lockをコピー
COPY Gemfile Gemfile.lock ./

# 必要なGemのインストール
RUN bundle install && \
    bundle exec bootsnap precompile --gemfile && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git

# アプリケーションコードをコピー
COPY . .

# Bootsnapのプリコンパイル
RUN bundle exec bootsnap precompile app/ lib/

# 最終ステージ
FROM base

# デプロイに必要なパッケージのインストール
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
        curl \
        postgresql-client \
        imagemagick \
        libmagickwand-dev \
        fonts-noto-cjk \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives

# ビルドステージからGemsとアプリケーションコードをコピー
COPY --from=build "${BUNDLE_PATH}" "${BUNDLE_PATH}"
COPY --from=build /rails /rails

# 非rootユーザーの設定
RUN groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash && \
    chown -R 1000:1000 db log storage tmp
RUN mkdir -p /rails/public/ogp && chmod 777 /rails/public/ogp


USER 1000:1000

# Entrypointの設定
ENTRYPOINT ["/rails/bin/docker-entrypoint"]

# サーバーの起動
EXPOSE 3000
CMD ./bin/rails server -b 0.0.0.0 -p ${PORT:-3000}
