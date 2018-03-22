/*
 * Copyright (C) 2018 Atol Conseils et Développements.
 * http://www.atolcd.com/
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

function main() {
  var repoUsage = {
    id : "RepoUsage",
    name : "AtolStatistics.RepoUsage",
    options : {
      siteId: page.url.templateArgs.site || "",
      currentUser: user.name,
      isAdmin: user.isAdmin,
      limit: 10,
      chartLabelSizeMin: 850
    }
  };

  model.widgets = [repoUsage];
}

main();