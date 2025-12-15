# frozen_string_literal: true

class Collaborators::IncomingsController < Sellers::BaseController
  layout "inertia"

  def index
    authorize Collaborator

    collaborators_presenter = CollaboratorsPresenter.new(seller: current_seller)
    render inertia: "Collaborators/Incomings/Index", props: collaborators_presenter.incomings_index_props
  end

  private
    def set_title
      @title = "Collaborators"
    end
end
