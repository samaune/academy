//
// Copyright (C) 2015 - present Instructure, Inc.
//
// This file is part of Canvas.
//
// Canvas is free software: you can redistribute it and/or modify it under
// the terms of the GNU Affero General Public License as published by the Free
// Software Foundation, version 3 of the License.
//
// Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
// details.
//
// You should have received a copy of the GNU Affero General Public License along
// with this program. If not, see <http://www.gnu.org/licenses/>.
//

import {find, forEach} from 'lodash'
import * as tz from '@instructure/moment-utils'
import {useScope as createI18nScope} from '@canvas/i18n'
import GradingPeriodsHelper from './GradingPeriodsHelper'
import DateHelper from '@canvas/datetime/dateHelper'

const I18n = createI18nScope('DateValidator')

const DATE_RANGE_ERRORS = {
  due_at: {
    start_range: {
      get section() {
        return I18n.t('Due date cannot be before section start')
      },
      get course() {
        return I18n.t('Due date cannot be before course start')
      },
      get term() {
        return I18n.t('Due date cannot be before term start')
      },
    },
    end_range: {
      get section() {
        return I18n.t('Due date cannot be after section end')
      },
      get course() {
        return I18n.t('Due date cannot be after course end')
      },
      get term() {
        return I18n.t('Due date cannot be after term end')
      },
    },
  },
  unlock_at: {
    start_range: {
      get section() {
        return I18n.t('Unlock date cannot be before section start')
      },
      get course() {
        return I18n.t('Unlock date cannot be before course start')
      },
      get term() {
        return I18n.t('Unlock date cannot be before term start')
      },
    },
    end_range: {
      get due() {
        return I18n.t('Unlock date cannot be after due date')
      },
      get replyToTopicDue() {
        return I18n.t('Unlock date cannot be after reply to topic due date')
      },
      get replyToEntryDue() {
        return I18n.t('Unlock date cannot be after required replies due date')
      },
      get lock() {
        return I18n.t('Unlock date cannot be after lock date')
      },
    },
  },
  lock_at: {
    start_range: {
      get due() {
        return I18n.t('Lock date cannot be before due date')
      },
      get replyToTopicDue() {
        return I18n.t('Lock date cannot be before reply to topic due date')
      },
      get replyToEntryDue() {
        return I18n.t('Lock date cannot be before required replies due date')
      },
    },
    end_range: {
      get section() {
        return I18n.t('Lock date cannot be after section end')
      },
      get course() {
        return I18n.t('Lock date cannot be after course end')
      },
      get term() {
        return I18n.t('Lock date cannot be after term end')
      },
    },
  },
}

export default class DateValidator {
  constructor(params) {
    this.dateRange = params.date_range
    this.hasGradingPeriods = params.hasGradingPeriods
    this.gradingPeriods = params.gradingPeriods
    this.userIsAdmin = params.userIsAdmin
    this.dueDateRequired = params.postToSIS && ENV.DUE_DATE_REQUIRED_FOR_ACCOUNT
  }

  validateDatetimes(data) {
    const lockAt = data.lock_at
    const unlockAt = data.unlock_at
    const dueAt = data.due_at
    const requiredrepliesDueAt = data.required_replies_due_at
    const replyToTopicDueAt = data.reply_to_topic_due_at
    const section_id = data.set_type === 'CourseSection' ? data.set_id : data.course_section_id
    const section = find(ENV.SECTION_LIST, {id: section_id})
    const currentDateRange = section ? this.getSectionRange(section) : this.dateRange
    const datetimesToValidate = []
    const forIndividualStudents = data.student_ids?.length || data.set_type === 'ADHOC'

    if (currentDateRange.start_at && currentDateRange.start_at.date && !forIndividualStudents) {
      datetimesToValidate.push({
        date: currentDateRange.start_at.date,
        validationDates: {
          due_at: dueAt,
          unlock_at: unlockAt,
        },
        range: 'start_range',
        type: currentDateRange.start_at.date_context,
      })
    }
    if (currentDateRange.end_at && currentDateRange.end_at.date && !forIndividualStudents) {
      datetimesToValidate.push({
        date: currentDateRange.end_at.date,
        validationDates: {
          due_at: dueAt,
          lock_at: lockAt,
        },
        range: 'end_range',
        type: currentDateRange.end_at.date_context,
      })
    }
    if (dueAt) {
      datetimesToValidate.push({
        date: dueAt,
        validationDates: {
          lock_at: lockAt,
        },
        range: 'start_range',
        type: 'due',
      })
      datetimesToValidate.push({
        date: dueAt,
        validationDates: {
          unlock_at: unlockAt,
        },
        range: 'end_range',
        type: 'due',
      })
    }

    if (requiredrepliesDueAt) {
      datetimesToValidate.push({
        date: requiredrepliesDueAt,
        validationDates: {
          lock_at: lockAt,
        },
        range: 'start_range',
        type: 'replyToEntryDue',
      })
      datetimesToValidate.push({
        date: requiredrepliesDueAt,
        validationDates: {
          unlock_at: unlockAt,
        },
        range: 'end_range',
        type: 'replyToEntryDue',
      })
    }

    if (replyToTopicDueAt) {
      datetimesToValidate.push({
        date: replyToTopicDueAt,
        validationDates: {
          lock_at: lockAt,
        },
        range: 'start_range',
        type: 'replyToTopicDue',
      })
      datetimesToValidate.push({
        date: replyToTopicDueAt,
        validationDates: {
          unlock_at: unlockAt,
        },
        range: 'end_range',
        type: 'replyToTopicDue',
      })
    }

    if (this.dueDateRequired) {
      datetimesToValidate.push({
        date: dueAt,
        dueDateRequired: this.dueDateRequired,
      })
    }

    if (
      this.hasGradingPeriods &&
      !this.userIsAdmin &&
      data.persisted === false &&
      data.skip_grading_periods !== true
    ) {
      datetimesToValidate.push({
        date: dueAt,
        range: 'grading_period_range',
      })
    }

    if (lockAt) {
      datetimesToValidate.push({
        date: lockAt,
        validationDates: {
          unlock_at: unlockAt,
        },
        range: 'end_range',
        type: 'lock',
      })
    }
    const errs = {}
    return this._validateDatetimeSequences(datetimesToValidate, errs)
  }

  getSectionRange(section) {
    const dateRange = {...this.dateRange}
    const override_course_dates = section.override_course_and_term_dates
    // if !override_course_dates, then use the earlier start date and the later end date
    // if override_course_dates, then use the section start and end dates
    if (
      section.start_at &&
      (override_course_dates ||
        this._formatDatetime(section.start_at) < this._formatDatetime(dateRange.start_at.date))
    ) {
      dateRange.start_at = {
        date: section.start_at,
        date_context: 'section',
      }
    }
    if (
      section.end_at &&
      (override_course_dates ||
        this._formatDatetime(section.end_at) > this._formatDatetime(dateRange.end_at.date))
    ) {
      dateRange.end_at = {
        date: section.end_at,
        date_context: 'section',
      }
    }
    return dateRange
  }

  isDateInClosedGradingPeriod(date) {
    if (!date || !this.hasGradingPeriods || this.userIsAdmin) return false
    const helper = new GradingPeriodsHelper(this.gradingPeriods)
    const dueAt = date === null ? null : new Date(this._formatDatetime(date))
    return helper.isDateInClosedGradingPeriod(dueAt)
  }

  _validateMultipleGradingPeriods(date, errs) {
    const helper = new GradingPeriodsHelper(this.gradingPeriods)
    const dueAt = date === null ? null : new Date(this._formatDatetime(date))
    if (!helper.isDateInClosedGradingPeriod(dueAt)) return

    const earliestDate = helper.earliestValidDueDate
    if (earliestDate) {
      const formatted = DateHelper.formatDateForDisplay(earliestDate)
      errs.due_at = I18n.t('Please enter a due date on or after %{earliestDate}', {
        earliestDate: formatted,
      })
    } else {
      errs.due_at = I18n.t('Due date cannot fall in a closed grading period')
    }
  }

  _validateDatetimeSequences(datetimesToValidate, errs) {
    datetimesToValidate.forEach(datetimeSet => {
      if (datetimeSet.dueDateRequired && !datetimeSet.date) {
        errs.due_at = I18n.t('Please add a due date')
      }
      if (datetimeSet.range === 'grading_period_range') {
        this._validateMultipleGradingPeriods(datetimeSet.date, errs)
      } else if (datetimeSet.date) {
        switch (datetimeSet.range) {
          case 'start_range':
            forEach(datetimeSet.validationDates, (validationDate, dateType) => {
              if (
                validationDate &&
                this._formatDatetime(datetimeSet.date) > this._formatDatetime(validationDate)
              ) {
                errs[dateType] = DATE_RANGE_ERRORS[dateType][datetimeSet.range][datetimeSet.type]
              }
            })
            break
          case 'end_range':
            forEach(datetimeSet.validationDates, (validationDate, dateType) => {
              if (
                validationDate &&
                this._formatDatetime(datetimeSet.date) < this._formatDatetime(validationDate)
              ) {
                errs[dateType] = DATE_RANGE_ERRORS[dateType][datetimeSet.range][datetimeSet.type]
              }
            })
            break
        }
      }
    })
    return errs
  }

  _formatDatetime(date) {
    return tz.format(tz.parse(date), '%F %R')
  }
}
