import gql from 'graphql-tag';

export default {
  queries: {
    getUser: gql`
      query generic_getUserQuery {
        user {
          id
          isAuthenticated
          email
          fullName
          intercomHash
          dateJoined
          isOrgAdmin
          isImpersonating
          isOnMultiaccount
          isAffiliateAdmin
          impersonateOriginUser {
            isSuperuser
          }
          shouldRecordSession
          language
          isSuperuser
          isCfo
          isAffiliate
          salesManager {
            id
          }
          promptForSwitchReason
          defaultKeywordsColumns
          defaultCompetitorsColumns
          defaultLandingPagesColumns
          defaultTagCloudColumns
          defaultNotesColumns
          defaultKeywordsNotificationsColumns
          defaultKeywordsPage
          defaultCompareTo
          organization {
            id
            name
            type
            active
            accountBlocked
            accountBlockedReason {
              title
              message
            }
            activePlan {
              id
              isTrial
              category
              originPlan {
                id
              }
              isPrepaidVoucher
              priceMonthly
              endDate
              maxUsers
              maxKeywords
              maxCompetitors
              billingCycleInMonths
              featureCanPause
              featureAdvancedMetrics
            }
            nextPlan {
              id
            }
            isPartner
            dateAdded
            errors {
              failedPayment
              trialExpired
              planExpired
              keywordRefreshDisabled
              systemHealthNotice
            }
            phoneNumber
            numberOfUsers
            numberOfCompetitors
            domainWithHighestCompetitors
            numberOfDomains
            numberOfDomainsWithGa
            numberOfDomainsWithGwt
            numberOfKeywords
            multiAccountOwners {
              id
            }
            salesManager {
              meetingLink
            }
          }
          savedFilters {
            id
            name
            type
            defaultForDomains
            defaultForKeywords
            filters
          }
          news {
            id
            body
            read
          }
          unseenReleases {
            id
            changes
            createdAt
            version
          }
          unansweredFeedback {
            id
            text
          }
          googleConnections {
            id
          }
          runningTasks {
            id
            description
            lastKnownState
            progress {
              current
              total
            }
          }
        }
      }
    `,
  },
  mutations: {
    updateUserSettings: gql`
      mutation generic_updateUserSettings($input: UpdateUserSettingsInput!) {
        updateUserSettings(input: $input) {
          user {
            id
            defaultKeywordsColumns
            defaultCompetitorsColumns
            defaultLandingPagesColumns
            defaultTagCloudColumns
            defaultNotesColumns
            defaultKeywordsNotificationsColumns
            defaultKeywordsPage
            defaultCompareTo
          }
        }
      }
    `,
  },
};
