#! /bin/bash

set -e

workdir="$PWD"

REQUIRE_FULL_RUN=(
  "bitbucket-pipelines.yml"
  "bitbucket-pipelines-prepare.sh"
  "bitbucket-pipelines-run.sh"
)

# Get a list of all modules (folders containing bitbucket-pipelines-run.sh file)
modules=$(ls -- */bitbucket-pipelines-run.sh)
modules=($modules)  # split to array $names"
for (( i=0; i<${#modules[@]}; i++ ))
do
  modules[$i]=$(echo "${modules[$i]%/*}")  # Get only the folder name
done

echo ""
echo "Modules found in the repository:"
for ((i = 0; i < ${#modules[@]}; i++)); do
  echo "$i: ${modules[$i]}"
done

# If the script is ran with a specific valid module param,
# run only this module (still if there are changes)
if [ "$#" ] >&1; then
  for ((i = 0; i < ${#modules[@]}; i++)); do
    if [[ ${modules[$i]} == $1 ]]; then
      echo ""
      echo "Specific module passed: $1"
      echo "Only $1 will run (if there are changes)"
      modules=($1)
    fi
  done
fi

echo ""
echo "Root files requiring a full run"
for ((i = 0; i < ${#REQUIRE_FULL_RUN[@]}; i++)); do
  echo "$i: ${REQUIRE_FULL_RUN[$i]}"
done

# Define an array of modules to run
modules_to_run=()

# See if rebuild is forced despite potentially no file changes
if [ "$2" == "force" ]; then
  echo ""
  echo "Build is forced. It will do a full run even if there are no file changes"
  modules_to_run=(${modules[0]})
fi

# See what files changed. If they changed in folders, only run those modules.
# If they changed in root, run all modules.
echo ""
echo "Grabbing pipelines from Bitbucket API..."

changed_files=""
do_full_run=false

findSuccessfulPipeline() {
  # page number for bitbucket api pagination
  local pageNumber=$1

  # Get the latest 100 pipelines for the current repository
  pipelines=$(
    curl "https://$BITBUCKET_USERNAME:$BITBUCKET_PASSWORD@api.bitbucket.org/2.0/repositories/$BITBUCKET_REPO_OWNER/$BITBUCKET_REPO_SLUG/pipelines/?sort=-created_on&pagelen=100&page=$pageNumber" |
      jq '.values'
  )

  if [ "$pipelines" = "[]" ]; then
    # if the array of pipelines is empty, do a full run.
    echo "[]"
  else
    # Filter the array for and return the first successful pipeline
    last_successful_pipeline=$(jq -c '[.[] | select(.state.result.name | . and contains("SUCCESSFUL")) | select(.target.ref_name=='\""$BITBUCKET_BRANCH\""')][0]' <<<"${pipelines}")
    hash=$(jq '.target.commit.hash' <<<"${last_successful_pipeline}")

    if [ "$hash" == "null" ]; then
      # If no successful pipeline is found, search in the next 100 pipelines
      findSuccessfulPipeline $((pageNumber + 1))
    else
      # return the commit hash of the last successful pipeline
      echo "$hash"
    fi
  fi
}

last_successful_commit=$(findSuccessfulPipeline 1)

if [[ "$last_successful_commit" = "[]" || "$2" == "force" ]]; then
  if [ "$last_successful_commit" = "[]" ]; then
    echo ""
    echo "No successful commits found. Doing full run."
  fi
  do_full_run=true
elif [ -n "$last_successful_commit" ]; then
  echo ""
  echo "Valid hash found: $last_successful_commit"
  # remove the quotes from the string to give the raw hash
  stripped_hash="$(sed -e 's/^"//' -e 's/"$//' <<<"$last_successful_commit")"
  # compare the changes between the current commit and the last successful commit
  changed_files=$(git diff --name-only --pretty="format:" "$stripped_hash" "$BITBUCKET_COMMIT")
fi

SAVEIFS=$IFS                   # Save current IFS
IFS=$'\n'                      # Change IFS to new line
changed_files=($changed_files) # split to array $names
IFS=$SAVEIFS                   # Restore IFS

echo ""
echo "Changed files:"

for ((i = 0; i < ${#changed_files[@]}; i++)); do
  echo "$i: ${changed_files[$i]}"
  # Check if the changed path contains a slash
  if [[ ${changed_files[$i]} == *"/"* ]]; then

    # The path contains a slash, check if the folder is in one of the modules
    for ((j = 0; j < ${#modules[@]}; j++)); do
      if [[ "${changed_files[$i]}" =~ ^${modules[j]} ]]; then
        # If this module hasn't been added to the run list yet, add it
        if [[ ${modules_to_run[*]} =~ "${modules[j]}" ]]; then
          :
        else
          modules_to_run+=(${modules[j]})
        fi
      fi
    done
  else
    # The changed path does not contain a slash (it is a root file).
    # Normally, do nothing, but if the file is a special one (like bitbucket-pipelines.yml) then
    # run all modules
    if [[ ${REQUIRE_FULL_RUN[*]} =~ ${changed_files[$i]} ]]; then
      do_full_run=true
    fi
  fi
done

# If there was a file changed that requires a full run, set the modules to run to all modules
echo ""
echo "Do full run: $do_full_run"
if [ "$do_full_run" = true ]; then
  modules_to_run=(${modules[*]})
fi

echo ""
if [ ${#modules_to_run[@]} != 0 ]; then
  echo "Final list of modules to run:"
  for ((i = 0; i < ${#modules_to_run[@]}; i++)); do
    echo "$i: ${modules_to_run[$i]}"
  done
else
  echo 'No modules required a run!'
fi

# Now, run all modules
for ((i = 0; i < ${#modules_to_run[@]}; i++)); do
  run_path="${modules_to_run[$i]}/bitbucket-pipelines-run.sh"
  echo ""
  echo "Running: $run_path"
  cd "${modules_to_run[$i]}"
  source ./bitbucket-pipelines-run.sh
  cd "$workdir"
done
