import Foundation
import UIKit
import StoreKit

@objc(RnAppRating)
class RnAppRating: NSObject {

  @objc
  func showInAppReview (_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
      if #available(iOS 14.0, *) {
        if let scene = UIApplication.shared.connectedScenes.first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene {
            SKStoreReviewController.requestReview(in: scene)
            resolve(true);
        } else {
          reject("Failed to fetch scene in iOS");
        }
    } else if #available(iOS 10.3, *) {
        SKStoreReviewController.requestReview()
        resolve(true);
    } else {
        reject("Unsupported iOS version");
    }
  }
}
