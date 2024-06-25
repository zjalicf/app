package com.acreom.app;

import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.view.View;
import android.graphics.Color;

import com.getcapacitor.BridgeActivity;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(GoogleAuth.class);

        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            String color = "#2e3643";
            Boolean darkButtons = false;

            Window window = getWindow();
            int options = window.getDecorView().getSystemUiVisibility() | WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS;

            if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && darkButtons) {
                options |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            } else {
                options &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            }

            window.getDecorView().setSystemUiVisibility(options);
            window.setNavigationBarColor(Color.parseColor(color));
        }

    }
}
