# frozen_string_literal: true

#
# Copyright (C) 2025 - present Instructure, Inc.
#
# This file is part of Canvas.
#
# Canvas is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the Free
# Software Foundation, version 3 of the License.
#
# Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.
require_relative "../../common"

describe "Screenreader Gradebook grading" do
  include_context "in-process server selenium tests"
  context "checkpoints" do
    before do
      Account.site_admin.enable_feature! :discussion_checkpoints
      Account.site_admin.enable_feature!(:react_discussions_post)

      @teacher = course_with_teacher_logged_in(active_course: true, active_all: true, name: "teacher").user
      @student1 = student_in_course(course: @course, name: "student", active_all: true).user
      @student2 = student_in_course(course: @course, name: "student2", active_all: true).user
      @course.root_account.enable_feature!(:discussion_checkpoints)

      @checkpointed_discussion = DiscussionTopic.create_graded_topic!(course: @course, title: "Checkpointed Discussion")
      @checkpointed_assignment = @checkpointed_discussion.assignment

      Checkpoints::DiscussionCheckpointCreatorService.call(
        discussion_topic: @checkpointed_discussion,
        checkpoint_label: CheckpointLabels::REPLY_TO_TOPIC,
        dates: [{ type: "everyone", due_at: 2.days.from_now }],
        points_possible: 5
      )

      Checkpoints::DiscussionCheckpointCreatorService.call(
        discussion_topic: @checkpointed_discussion,
        checkpoint_label: CheckpointLabels::REPLY_TO_ENTRY,
        dates: [{ type: "everyone", due_at: 5.days.from_now }],
        points_possible: 15,
        replies_required: 3
      )

      3.times do |i|
        entry = @checkpointed_discussion.discussion_entries.create!(user: @student1, message: " reply to topic i#{i} ", created_at: Time.zone.now + i.hours)
        @checkpointed_discussion.discussion_entries.create!(user: @student2, message: " reply to entry i#{i} ", root_entry_id: entry.id, parent_id: entry.id, created_at: Time.zone.now + i.hours)
      end

      3.times do |j|
        entry = @checkpointed_discussion.discussion_entries.create!(user: @student2, message: " reply to topic j#{j} ", created_at: Time.zone.now + j.days)
        @checkpointed_discussion.discussion_entries.create!(user: @student1, message: " reply to entry j#{j} ", root_entry_id: entry.id, parent_id: entry.id, created_at: Time.zone.now + j.days)
      end

      entry = @checkpointed_discussion.discussion_entries.create!(user: @teacher, message: " reply to topic k0 ")
      @checkpointed_discussion.discussion_entries.create!(user: @student1, message: " reply to entry k0 ", root_entry_id: entry.id, parent_id: entry.id)

      @entry = DiscussionEntry.where(message: " reply to topic j2 ").first
      @student_2_first_entry = DiscussionEntry.where(message: " reply to entry i0 ").first
      @student_2_last_entry = DiscussionEntry.where(message: " reply to topic j2 ").first
      dtp = @checkpointed_discussion.discussion_topic_participants.where(user_id: @teacher).first
      dtp.sort_order = "asc"
      dtp.save!
    end

    context "discussions_speedgrader_revisit" do
      before do
        @course.account.enable_feature!(:discussions_speedgrader_revisit)
      end

      # flaky will revisit
      xit "defaults to last-oldest entry", :ignore_js_errors do
        dtp = @checkpointed_discussion.discussion_topic_participants.where(user_id: @teacher).first
        dtp.sort_order = "desc"
        dtp.save!
        get "/courses/#{@course.id}/gradebook/speed_grader?assignment_id=#{@checkpointed_assignment.id}&student_id=#{@student2.id}"
        f("button[title='Settings']").click
        fj("li:contains('Options')").click
        fj("label:contains('Show replies in context')").click
        fj(".ui-dialog-buttonset .ui-button:visible:last").click

        expect(f("button[data-testid='discussions-previous-reply-button']")).to be_present
        expect(f("button[data-testid='discussions-first-reply-button']")).to be_disabled
        expect(f("button[data-testid='discussions-previous-reply-button']")).to be_disabled
        expect(f("body").text).to include("Reply 1 of 6")

        in_frame("speedgrader_iframe") do
          in_frame("discussion_preview_iframe") do
            sleep 3
            wait_for_ajaximations
            expect(f("body").text).to include("reply to entry i0")
          end
        end
      end

      it "goes to last entry", :ignore_js_errors do
        get "/courses/#{@course.id}/gradebook/speed_grader?assignment_id=#{@checkpointed_assignment.id}&student_id=#{@student2.id}&entry_id=#{@student_2_first_entry.id}"
        f("button[title='Settings']").click
        fj("li:contains('Options')").click
        fj("label:contains('Show replies in context')").click
        fj(".ui-dialog-buttonset .ui-button:visible:last").click

        expect(f("button[data-testid='discussions-previous-reply-button']")).to be_present
        expect(f("button[data-testid='discussions-first-reply-button']")).to be_disabled
        expect(f("button[data-testid='discussions-previous-reply-button']")).to be_disabled
        expect(f("body").text).to include("Reply 1 of 6")
        sleep 5

        f("button[data-testid='discussions-last-reply-button']").click
        expect(f("body").text).to include("Reply 6 of 6")

        expect(f("button[data-testid='discussions-first-reply-button']")).to be_enabled
        expect(f("button[data-testid='discussions-previous-reply-button']")).to be_enabled
        expect(f("button[data-testid='discussions-next-reply-button']")).to be_disabled
        expect(f("button[data-testid='discussions-last-reply-button']")).to be_disabled

        in_frame("speedgrader_iframe") do
          in_frame("discussion_preview_iframe") do
            wait_for_ajaximations
            expect(f("body").text).to include("reply to topic j2")
          end
        end
      end

      it "goes to first entry", :ignore_js_errors do
        get "/courses/#{@course.id}/gradebook/speed_grader?assignment_id=#{@checkpointed_assignment.id}&student_id=#{@student2.id}&entry_id=#{@student_2_last_entry.id}"
        f("button[title='Settings']").click
        fj("li:contains('Options')").click
        fj("label:contains('Show replies in context')").click
        fj(".ui-dialog-buttonset .ui-button:visible:last").click

        expect(f("button[data-testid='discussions-next-reply-button']")).to be_present
        expect(f("button[data-testid='discussions-last-reply-button']")).to be_disabled
        expect(f("button[data-testid='discussions-next-reply-button']")).to be_disabled
        expect(f("body").text).to include("Reply 6 of 6")

        sleep 3
        f("button[data-testid='discussions-first-reply-button']").click
        expect(f("body").text).to include("Reply 1 of 6")

        expect(f("button[data-testid='discussions-last-reply-button']")).to be_enabled
        expect(f("button[data-testid='discussions-next-reply-button']")).to be_enabled
        expect(f("button[data-testid='discussions-previous-reply-button']")).to be_disabled
        expect(f("button[data-testid='discussions-first-reply-button']")).to be_disabled

        in_frame("speedgrader_iframe") do
          in_frame("discussion_preview_iframe") do
            sleep 3
            wait_for_ajaximations
            expect(f("body").text).to include("reply to entry i0")
          end
        end
      end

      it "can navigate prev and next", :ignore_js_errors do
        get "/courses/#{@course.id}/gradebook/speed_grader?assignment_id=#{@checkpointed_assignment.id}&student_id=#{@student1.id}&entry_id=#{@student_2_first_entry.id}"
        f("button[title='Settings']").click
        fj("li:contains('Options')").click
        fj("label:contains('Show replies in context')").click
        fj(".ui-dialog-buttonset .ui-button:visible:last").click

        expect(f("button[data-testid='discussions-previous-reply-button']")).to be_present
        expect(f("button[data-testid='discussions-first-reply-button']")).to be_disabled
        expect(f("button[data-testid='discussions-previous-reply-button']")).to be_disabled
        expect(f("body").text).to include("Reply 1 of 7")
        in_frame("speedgrader_iframe") do
          in_frame("discussion_preview_iframe") do
            expect(f("div[data-testid='isHighlighted']").text).to include(@student1.name)
            expect(f("div[data-testid='isHighlighted']").text).to include("reply to topic i0")
          end
        end

        f("button[data-testid='discussions-next-reply-button']").click
        wait_for_ajaximations
        expect(f("body").text).to include("Reply 2 of 7")
        in_frame("speedgrader_iframe") do
          in_frame("discussion_preview_iframe") do
            expect(f("div[data-testid='isHighlighted']").text).to include(@student1.name)
            expect(f("div[data-testid='isHighlighted']").text).to include("reply to topic i1")
          end
        end

        f("button[data-testid='discussions-next-reply-button']").click
        wait_for_ajaximations
        expect(f("body").text).to include("Reply 3 of 7")
        in_frame("speedgrader_iframe") do
          in_frame("discussion_preview_iframe") do
            expect(f("div[data-testid='isHighlighted']").text).to include(@student1.name)
            expect(f("div[data-testid='isHighlighted']").text).to include("reply to topic i2")
          end
        end

        f("button[data-testid='discussions-previous-reply-button']").click
        wait_for_ajaximations
        expect(f("body").text).to include("Reply 2 of 7")
        in_frame("speedgrader_iframe") do
          in_frame("discussion_preview_iframe") do
            expect(f("div[data-testid='isHighlighted']").text).to include(@student1.name)
            expect(f("div[data-testid='isHighlighted']").text).to include("reply to topic i1")
          end
        end

        f("button[data-testid='discussions-previous-reply-button']").click
        wait_for_ajaximations
        expect(f("body").text).to include("Reply 1 of 7")
        in_frame("speedgrader_iframe") do
          in_frame("discussion_preview_iframe") do
            expect(f("div[data-testid='isHighlighted']").text).to include(@student1.name)
            expect(f("div[data-testid='isHighlighted']").text).to include("reply to topic i0")
          end
        end

        expect(f("button[data-testid='discussions-first-reply-button']")).to be_disabled
        expect(f("button[data-testid='discussions-previous-reply-button']")).to be_disabled
      end
    end
  end
end
