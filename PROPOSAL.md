
# Pa11y Sidekick Proposal

The Pa11y team is very excited to announce plans for our next project. We're code-naming this project "Sidekick".

We're proposing Pa11y Sidekick as the successor to both [pa11y-dashboard] and [pa11y-webservice]. We have put together this document to gather feedback and input from the vibrant community that's built up around Pa11y.


## Table of Contents

  - [Principles](#principles)
  - [Outline](#outline)
  - [Roadmap](#roadmap)
    - [Proposal](#proposal-)
    - [Architecture](#architecture-)
    - [Alpha](#alpha-)
    - [Beta](#beta-)
    - [V1](#v1-)
  - [FAQs](#faqs)
  - [History](#history)
  - [Feedback](#feedback)


## Principles

When gathering feedback and working on Pa11y Sidekick, we aim to follow these guiding principles. These are all based on traps we have fallen into during the development of the dashboard and webservices ([which you can read about here](#history)).

  - **Plan in the open**. We planned pa11y-dashboard behind closed doors, it didn't work out that well for the project in the long term. Pa11y Sidekick will be planned in the open.

  - **Develop in the open**. Similarly, pa11y-dashboard was developed in a closed-first way as a private repository. Pa11y Sidekick will be open source from the [architecture stage](#architecture-).

  - **No knowledge silos**. We have some serious knowledge silos with the existing projects, and a lot of the code has a bus factor of one. Our documentation and guides need to be _way_ better for Pa11y Sidekick.

  - **Make it easy to deploy**. The existing projects are all difficult to deploy. We want one-click (or as few clicks as possible) deployment to cloud services.

  - **Keep it up to date**. The dashboard and webservice have suffered from extended periods without maintenance. Pa11y Sidekick and its dependencies should be kept up to date.

  - **Make it accessible**. It seems obvious, but ironically the dashboard suffers from some accessibility issues of its own. This is unacceptable (and we'll be looking at this anyway).


## Outline

We'd like to avoid going into too many specifics at this early stage. We have lots of ideas for features, and we're sure you do too! If we overly prescribe now then we could miss out on your input. Here are a few technical and architectural decisions we'd like to propose:

  - **An updated model**. Currently, pa11y-dashboard allows you to add URLs at the top level and results are stored within those. We'd like to introduce the idea of "Sites" and "URLs". Users would be able to create sites in the interface and add multiple URLs to them. It would then be possible to view graphs at both levels, and run tests against either an entire site or individual URLs.

  - **Logins**. We think Pa11y Sidekick could really benefit from a login system. This could allow admins to set permission levels on a per-site basis, or make the graphs publicly viewable but restrict editing to just the development team.

  - **Lower the focus on scheduled runs**. Scheduled runs are useful, but what's _more_ useful is if your Continuous Integration or deployment process can easily trigger a Pa11y run when you push a change to the site. We're thinking web-hooks and tighter integration with GitHub and other third-party services.

  - **Diffing/Alerts**. You should be able to easily see which errors are new since the last run, or which ones have been fixed. Pa11y Sidekick should also notify you promptly when it finds new issues.

  - **Exports/Reporting**. We'd like to free your accessibility data. Embeddable graphs and badges would be great.

  - **A unified application**. No more split of the webservice and dashboard. Pa11y Sidekick should still have a first-class API, but it will no longer be run separately.

  - **Use a relational database**. We've decided to ditch MongoDB, and we'd like to move to [PostgreSQL].


## Roadmap

There's an incredible amount we _could_ add in the first version of Pa11y Sidekick, but we're going to have to be realistic and come up with a roadmap. We've outlined the different stages we envisage this project going through below:

### Proposal ![proposal stage][status-badge-proposal]

Where we're at now. In this early stage of the project, we'd like to focus on community input and building an extended backlog of user needs that we want to cater for. At the end of this document is a [feedback section](#feedback) which we'd love you to fill out.

### Architecture ![architecture stage][status-badge-architecture]

The architecture stage of the project is where the core team will build a bare-bones application (with no actual Pa11y Sidekick features). This will be used to demonstrate the structure of the application and will be opened for review by members of the community.

The purpose of this is to build a stable platform that we can all work on together. If everyone piled on the code immediately, we'd struggle to build something maintainable and well documented.

### Alpha ![alpha stage][status-badge-alpha]

At this stage, the core team will have decided on a feature set that we can commit to for launch of a stable `1.0.0`. Everybody is welcome to contribute, but at this stage of the project it's not recommended to use in production.

The code will be versioned with a `0` major version (`0.x.x`), and most releases will include breaking changes.

The purpose of this stage is to gather feedback on early implementations of features, and to allow for some user testing.

### Beta ![beta stage][status-badge-beta]

At beta stage, we look for wider adoption and start considering the release process. Features at this stage of the project should be complete and well tested.

The code will continue to be versioned with a `0` major version (`0.x.x`), and releases will include breaking changes (but hopefully fewer of them). We'll communicate the start of the beta in the repo and via Twitter.

The purpose of this stage is to reach a level of stability and maintainability that will allow us to jump to `1.0.0`. Community participation and bug reports are essential at this point.

### V1 ![stable stage][status-badge-stable]

Version `1.0.0` will be stable, well tested, and a viable application to extend with all the features that didn't make it into this release.


## FAQs

We'll attempt to cover frequently asked questions here. If this section is thin on the ground, it's because we haven't been asked many yet.

### Why not iterate on pa11y-dashboard?

This is a very big question, and it has a big answer. We've attempted to cover this in the [history section of this proposal](#history).

### What will happen to pa11y-dashboard and pa11y-webservice?

Nothing will change immediately with how these projects are supported. We'll still be responding to issues and feature requests in the same way.

Larger features may not be considered, but we've been in this state for some time – it's difficult to confidently make changes in these projects due to the [reasons outlined here](#history).

Once Pa11y Sidekick reaches `1.0.0`, pa11y-dashboard and pa11y-webservice will be deprecated (with a long support end date). At this point we will recommend the use of Pa11y Sidekick over either of these projects.

### How can I help?

In the early stages, by requesting features and discussing the ones already [over in the issues](issues). Later we're going to need people to write code, tests, and documentation. We'll also need designers and comms people to help us promote the beta.

We're in the process of updating our website, which will have more information on contributing to Pa11y as a whole.

### Who are you?

We were originally a group of front end developers at [Nature Publishing Group]. Now we're dotted around London mostly. We'll link out to some kind of contact page once our website goes live.


## History

Work began on the dashboard and webservice back in 2013, and they took around two months to reach a stable version `1.0`. This work was done by [Rowan Manning] and [Perry Harlock] in between sprint work at [Nature Publishing Group], with direction from [Jude Robinson].

Despite building something that worked, there were a few key issues:

  - At the time, nobody involved was _that_ familiar with Node.js
  - The project (to build a dashboard) was split into two, we now think this was a mistake
  - The dashboard wasn't fully deployed and used within Nature for some time afterwards
  - The closed nature of the project in the conception stage meant that it caters for fewer real-world use-cases

As time went on, the [`pa11y`] command-line tool was continually worked on and improved. The dashboard and webservice, however, were left to stagnate a little.

While it worked for us internally there was less motivation to improve on what we had. Sprint work picked up for the core team members, and tech debt started to pile up.

Fast-forward to today: the dashboard and webservice, while working, don't do the best job they could. It's difficult to add features, there's low confidence in the code-base, and out of date dependencies prevent us from supporting the latest versions of Node.js.

In short, we've started to reach tech debt bankruptcy (despite the heroic efforts of [Hollie Kay], [José Bolos], and [Nick Call] to keep on top of things in their down-time).

The idea of a brand new dashboard-like project has been floating around in some of our heads for a little while. The core team met on 6th May 2016 to discuss the future of Pa11y, and we decided to write up this proposal to take back to the community.


## Feedback

Now that you've read through the proposal, we'd love your feedback!

  - Have an idea for a feature?
  - Want to help out?
  - Think we're doing this all wrong?

[Raise an issue on this repo](/pa11y/sidekick/issues), or get in touch on [Twitter].

Additionally, feel free to open a pull request to suggest changes to the proposal.



[hollie kay]: http://www.hollsk.co.uk/
[josé bolos]: https://github.com/joseluisbolos
[jude robinson]: https://github.com/dotcode
[nature publishing group]: http://www.nature.com/
[nick call]: https://github.com/nickcall
[`pa11y`]: https://github.com/springernature/pa11y
[pa11y-dashboard]: https://github.com/springernature/pa11y-dashboard
[pa11y-webservice]: https://github.com/springernature/pa11y-webservice
[perry harlock]: http://www.phwebs.co.uk/
[postgresql]: http://www.postgresql.org/
[rowan manning]: http://rowanmanning.com/
[status-badge-proposal]: https://img.shields.io/badge/status-proposal-red.svg
[status-badge-architecture]: https://img.shields.io/badge/status-architecture-orange.svg
[status-badge-alpha]: https://img.shields.io/badge/status-alpha-yellow.svg
[status-badge-beta]: https://img.shields.io/badge/status-beta-yellowgreen.svg
[status-badge-stable]: https://img.shields.io/badge/status-stable-green.svg
[twitter]: https://twitter.com/pa11yorg
