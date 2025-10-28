# frozen_string_literal: true

class Admin::Search::UsersController < Admin::Search::BaseController
  include Admin::ListPaginatedUsers

  def index
    @title = "Search for #{params[:query].present? ? params[:query].strip : "users"}"
    users = User.admin_search(params[:query]).order(created_at: :desc)
    list_paginated_users(users:, template: "Admin/Search/Users/Index")
  end
end
