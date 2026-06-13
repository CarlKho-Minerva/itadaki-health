/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

//
// ItadakiDATApp.swift
//
// Main entry point for the ItadakiDAT sample app demonstrating the Meta Wearables DAT SDK.
// This app shows how to connect to wearable devices (like Ray-Ban Meta smart glasses),
// stream live video from their cameras, and capture photos. It provides a complete example
// of DAT SDK integration including device registration, permissions, and media streaming.
//

import Foundation
import MWDATCore
import SwiftUI

#if DEBUG
import MWDATMockDevice
#endif

@main
struct ItadakiDATApp: App {
  #if DEBUG
  // Debug menu for simulating device connections during development
  @State private var debugMenuViewModel = DebugMenuViewModel(mockDeviceKit: MockDeviceKit.shared)
  #endif
  private let wearables: WearablesInterface
  @State private var wearablesViewModel: WearablesViewModel

  init() {
    do {
      try Wearables.configure()
    } catch {
      #if DEBUG
      NSLog("[ItadakiDAT] Failed to configure Wearables SDK: \(error)")
      #endif
    }

    #if DEBUG
    // Start the test server when launched by XCUITests so tests can control
    // mock device setup via HTTP commands from the test process.
    if ProcessInfo.processInfo.arguments.contains("--ui-testing") {
      MockDeviceKit.shared.enable(config: MockDeviceKitConfig(initiallyRegistered: false))

      let portFilePath = ProcessInfo.processInfo.environment["MWDAT_TEST_SERVER_PORT_FILE"]
      Task {
        try await MockDeviceKit.shared.startTestServer(portFilePath: portFilePath)
      }
    }
    #endif

    let wearables = Wearables.shared
    self.wearables = wearables
    self._wearablesViewModel = State(wrappedValue: WearablesViewModel(wearables: wearables))
  }

  var body: some Scene {
    WindowGroup {
      ZStack {
        // Main app view with access to the shared Wearables SDK instance.
        #if DEBUG
        MainAppView(
          wearables: wearables,
          viewModel: wearablesViewModel,
          debugAction: { debugMenuViewModel.showDebugMenu = true }
        )
        #else
        MainAppView(wearables: wearables, viewModel: wearablesViewModel)
        #endif

        RegistrationView(viewModel: wearablesViewModel)
          .frame(width: 0, height: 0)
          .accessibilityHidden(true)
      }
        .onOpenURL { url in
          Task {
            _ = try? await wearables.handleUrl(url)
          }
        }
        // Show error alerts for view model failures
        .alert("Error", isPresented: $wearablesViewModel.showError) {
          Button("OK") {
            wearablesViewModel.dismissError()
          }
        } message: {
          Text(wearablesViewModel.errorMessage)
        }
        #if DEBUG
      .sheet(isPresented: $debugMenuViewModel.showDebugMenu) {
        MockDeviceKitView(viewModel: debugMenuViewModel.mockDeviceKitViewModel)
      }
        #endif
    }
  }
}
