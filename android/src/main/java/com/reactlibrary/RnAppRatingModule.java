package com.reactlibrary;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
import java.util.Objects;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import com.google.android.play.core.review.ReviewInfo;
import com.google.android.play.core.review.ReviewManager;
import com.google.android.play.core.review.ReviewManagerFactory;
import com.google.android.play.core.tasks.Task;

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
    public void showInAppReview(Boolean debug, Promise promise) {
    		try {
						if (debug) {
							promise.resolve(true);
							return;
						}
						new Handler(Looper.getMainLooper()).post(() -> {
							ReviewManager reviewManager = ReviewManagerFactory.create(this.reactContext);

							Task<ReviewInfo> request = reviewManager.requestReviewFlow();
							request.addOnCompleteListener(task1 -> {
									if (task1.isSuccessful()) {
											ReviewInfo reviewInfo = task1.getResult();
											Activity currentActivity = getCurrentActivity();

											if (currentActivity == null) {
													promise.reject(new Error("no activity"));
													return;
											}

											Task<Void> flow = reviewManager.launchReviewFlow(currentActivity, reviewInfo);
											flow.addOnCompleteListener(task2 -> {
													promise.resolve(task2.isSuccessful());
											});
									} else {
											promise.reject(new Error(Objects.requireNonNull(task1.getException()).getMessage()));
									}
							});
						});
				} catch (Exception e) {
						promise.reject(e);
				}
    }
}
