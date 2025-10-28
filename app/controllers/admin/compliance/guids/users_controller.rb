# frozen_string_literal: true

class Admin::Compliance::Guids::UsersController < Admin::Compliance::Guids::BaseController
  include Admin::ListPaginatedUsers

  def index
    @title = page_title
    users = User.includes(:purchases).where(id: Event.by_browser_guid(guid).select(:user_id))
    list_paginated_users users:, template: "Admin/Compliance/Guids/Users/Index"
  end
end
