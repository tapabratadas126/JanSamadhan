"use client";

import React, {
  useState,
  Children,
  useRef,
  useLayoutEffect,
  HTMLAttributes,
  ReactNode,
} from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Check } from "lucide-react";

export interface AnimatedStepperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  initialStep?: number;
  currentStepControlled?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  completeButtonText?: string;
  disableStepIndicators?: boolean;
  canNavigateToStep?: (step: number) => boolean;
  renderStepIndicator?: (props: {
    step: number;
    currentStep: number;
    onStepClick: (clicked: number) => void;
  }) => ReactNode;
}

export function AnimatedStepper({
  children,
  initialStep = 1,
  currentStepControlled,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = "",
  stepContainerClassName = "",
  contentClassName = "",
  footerClassName = "",
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = "Back",
  nextButtonText = "Continue",
  completeButtonText = "Submit problem",
  disableStepIndicators = false,
  canNavigateToStep,
  renderStepIndicator,
  className = "",
  ...rest
}: AnimatedStepperProps) {
  const [internalStep, setInternalStep] = useState<number>(initialStep);
  const currentStep =
    typeof currentStepControlled === "number" ? currentStepControlled : internalStep;

  const [direction, setDirection] = useState<number>(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep: number) => {
    if (typeof currentStepControlled !== "number") {
      setInternalStep(newStep);
    }
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  return (
    <div
      className={`w-full flex flex-col items-center justify-center ${className}`}
      {...rest}
    >
      <div
        className={`mx-auto w-full max-w-3xl overflow-hidden rounded-[20px] bg-[#FFFFFF] border border-[#E5DFD0] ${stepCircleContainerClassName}`}
      >
        {/* Step Indicators */}
        <div
          className={`flex w-full items-center justify-between px-6 sm:px-8 pt-6 pb-2 border-b border-[#E5DFD0] bg-[#FAF7F0] ${stepContainerClassName}`}
        >
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            return (
              <React.Fragment key={stepNumber}>
                {renderStepIndicator ? (
                  renderStepIndicator({
                    step: stepNumber,
                    currentStep,
                    onStepClick: (clicked) => {
                      if (canNavigateToStep && !canNavigateToStep(clicked)) return;
                      setDirection(clicked > currentStep ? 1 : -1);
                      updateStep(clicked);
                    },
                  })
                ) : (
                  <StepIndicator
                    step={stepNumber}
                    disableStepIndicators={disableStepIndicators}
                    currentStep={currentStep}
                    onClickStep={(clicked) => {
                      if (canNavigateToStep && !canNavigateToStep(clicked)) return;
                      setDirection(clicked > currentStep ? 1 : -1);
                      updateStep(clicked);
                    }}
                  />
                )}
                {isNotLastStep && (
                  <StepConnector isComplete={currentStep > stepNumber} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Content Area with Dynamic Height */}
        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className={`px-6 sm:px-8 py-6 ${contentClassName}`}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {/* Footer Actions */}
        {!isCompleted && (
          <div
            className={`px-6 sm:px-8 pb-6 pt-4 border-t border-[#E5DFD0] bg-[#FAF7F0] ${footerClassName}`}
          >
            <div
              className={`flex items-center ${
                currentStep !== 1 ? "justify-between" : "justify-end"
              }`}
            >
              {currentStep !== 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-secondary text-sm font-semibold"
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              )}
              <button
                type="button"
                onClick={isLastStep ? handleComplete : handleNext}
                className="btn-primary text-sm font-semibold"
                {...nextButtonProps}
              >
                {isLastStep ? completeButtonText : nextButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Step Content Wrapper with dynamic height and slide animation
 */
function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
  className = "",
}: {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  children: ReactNode;
  className?: string;
}) {
  const [parentHeight, setParentHeight] = useState<number>(0);

  return (
    <motion.div
      style={{ position: "relative", overflow: "hidden" }}
      animate={{ height: isCompleted ? 0 : parentHeight || "auto" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className={className}
    >
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        {!isCompleted && (
          <SlideTransition
            key={currentStep}
            direction={direction}
            onHeightReady={(h) => setParentHeight(h)}
          >
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SlideTransition({
  children,
  direction,
  onHeightReady,
}: {
  children: ReactNode;
  direction: number;
  onHeightReady: (height: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      onHeightReady(containerRef.current.offsetHeight);
    }
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

const stepVariants: Variants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? -20 : 20,
    opacity: 0,
  }),
};

/**
 * Step Sub-component for individual step content
 */
export function Step({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-4">
      {title && (
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#17254A]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#5E5C54] mt-1">{subtitle}</p>
          )}
        </div>
      )}
      <div className="text-[#1C1B18]">{children}</div>
    </div>
  );
}

/**
 * Step Indicator Circle
 */
function StepIndicator({
  step,
  currentStep,
  onClickStep,
  disableStepIndicators = false,
}: {
  step: number;
  currentStep: number;
  onClickStep: (clicked: number) => void;
  disableStepIndicators?: boolean;
}) {
  const isComplete = currentStep > step;
  const isActive = currentStep === step;

  return (
    <button
      type="button"
      onClick={() => !disableStepIndicators && onClickStep(step)}
      disabled={disableStepIndicators || step > currentStep}
      className={`relative flex items-center justify-center ${
        !disableStepIndicators && step <= currentStep
          ? "cursor-pointer"
          : "cursor-default"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 font-semibold text-xs transition-colors duration-200 ${
          isComplete
            ? "bg-[#2E7D4F] border-[#2E7D4F] text-white"
            : isActive
            ? "bg-[#FFFFFF] border-[#2E7D4F] text-[#2E7D4F]"
            : "bg-[#F1ECDF] border-[#E5DFD0] text-[#5E5C54]"
        }`}
      >
        {isComplete ? (
          <Check className="h-4 w-4 stroke-[3]" />
        ) : (
          <span>{step}</span>
        )}
      </div>
    </button>
  );
}

/**
 * Connector line between indicators
 */
function StepConnector({ isComplete }: { isComplete: boolean }) {
  return (
    <div className="relative mx-3 sm:mx-4 h-[2px] flex-1 overflow-hidden rounded-full bg-[#E5DFD0]">
      <motion.div
        className="absolute inset-0 bg-[#2E7D4F] origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isComplete ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
      />
    </div>
  );
}

export default AnimatedStepper;
