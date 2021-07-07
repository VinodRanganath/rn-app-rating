package com.reactlibrary;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import com.google.android.play.core.review.ReviewInfo;
import com.google.android.play.core.review.ReviewManager;
import com.google.android.play.core.review.ReviewManagerFactory;
import com.google.android.play.core.task.Task;

public class RnAppRatingModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public RnAppRatingModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RnAppRating";
    }

    @ReactMethod
    public void showInAppReview(Promise promise) {
    		try {
						ReviewManager reviewManager = ReviewManagerFactory.create((AppCompatActivity) getCurrentActivity());

						Task<ReviewInfo> request = reviewManager.requestReviewFlow();
						request.addOnCompleteListener(task -> {
								if (task.isSuccessful()) {
										ReviewInfo reviewInfo = task.getResult();
										Task<Void> flow = reviewManager.launchReviewFlow((AppCompatActivity) getCurrentActivity(), reviewInfo);
										flow.addOnCompleteListener(task1 -> {
												promise.resolve(true);
										});
								} else {
										promise.reject(false);
								}
						});
				} catch (Exception e) {
						promise.reject(e);
				}
    }
}
