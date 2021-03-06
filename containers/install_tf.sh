#!/bin/bash -e

# Copyright 2017 Google Inc. All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Install the correct tensorflow variant depending on availability of GPU.
#
# pip install requires the wheel file name to match the name of the package
# inside it, so we need to copy the gpu-blah.whl files to blah.whl. The mess
# below conditionally (if VM has a GPU) creates a temporary directory, symlinks
# the wheels into the temporary directory, and cd's into that directory, so that
# the subsequent unconditional "pip install"s from the current directory do the
# right thing. Finally, the temporary directory is removed, if it was created.
cd /
T=""
if [ -d /usr/lib64-nvidia ] || [[ "${COLAB_GPU:-}" == "1" ]]; then
  T="$(mktemp -d)"
  for f in tensorflow*whl; do
    ln -s "/gpu-${f}" "${T}/${f}"
  done
  cd "$T"
fi

pip3 install -f /tf_deps -U --upgrade-strategy=only-if-needed tensorflow-*-*36*whl
pip2 install -f /tf_deps -U --upgrade-strategy=only-if-needed tensorflow-*-*cp27*whl

if [ -n "$T" ]; then
  rm -rf "$T"
fi

rm -rf /tf_deps
rm -f /install_tf.sh /tensorflow*whl /gpu-tensorflow*whl
