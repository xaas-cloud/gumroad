# frozen_string_literal: true

require "spec_helper"

describe IconHelper do
  describe "#icon" do
    it "renders icon without options" do
      output = icon("solid-search")
      expect(output).to include("mask-[url(~images/icons/solid-search.svg)]")
      expect(output).to include("bg-current")
    end

    it "renders icon with options" do
      output = icon("solid-search", class: "warning", title: "Search")
      expect(output).to include("mask-[url(~images/icons/solid-search.svg)]")
      expect(output).to include("warning")
      expect(output).to include('title="Search"')
    end
  end

  describe "#icon_yes" do
    it "renders the icon" do
      expect(icon_yes).to include("mask-[url(~images/icons/solid-check-circle.svg)]")
      expect(icon_yes).to include('aria-label="Yes"')
      expect(icon_yes).to include('style="color: rgb(var(--success))"')
    end
  end

  describe "#icon_no" do
    it "renders the icon" do
      expect(icon_no).to include("mask-[url(~images/icons/x-circle-fill.svg)]")
      expect(icon_no).to include('aria-label="No"')
      expect(icon_no).to include('style="color: rgb(var(--danger))"')
    end
  end
end
